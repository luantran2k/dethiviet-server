import PartEntity from 'src/exam/entities/part.entity';

const prismaUltis = {
  arrayToPrismaInput: (array: []) => {
    return {
      create: array,
    };
  },
  objectToPrismaCreate: (data: object) => {
    return Object.keys(data).reduce((output, key) => {
      if (Array.isArray(data[key as keyof object])) {
        const newValue = prismaUltis.arrayToPrismaInput(
          data[key as keyof object],
        );
        newValue.create = newValue.create.map((obj) =>
          prismaUltis.objectToPrismaCreate(obj),
        ) as [];
        return { ...output, [key]: newValue };
      }
      return { ...output, [key]: data[key as keyof object] };
    }, {});
  },
  arrayToPrismaUpdate: (array: object[], id: number) => {
    return {
      deleteMany: {
        NOT: array.map((item) => ({ id: item['id'] })),
      },
      upsert: array.map((obj) => {
        const id = obj['id' as keyof object];
        delete obj['id'];
        if (typeof id === 'number') {
          return {
            where: {
              id: id,
            },
            create: prismaUltis.objectToPrismaCreate(obj),
            update: prismaUltis.objectToPrismaUpdate(obj, id),
          };
        }
        return {
          where: {
            id: -1,
          },
          create: prismaUltis.objectToPrismaCreate(obj),
          update: prismaUltis.objectToPrismaUpdate(obj, id),
        };
      }),
    };
  },
  objectToPrismaUpdate: (data: object, id: number): object => {
    return Object.keys(data).reduce((output, key) => {
      if (Array.isArray(data[key as keyof object])) {
        const newValue = prismaUltis.arrayToPrismaUpdate(
          data[key as keyof object],
          id,
        );
        for (const obj of newValue.upsert) {
          obj.create = prismaUltis.objectToPrismaUpdate(
            obj.create,
            obj.where.id,
          );
        }
        return { ...output, [key]: newValue };
      }
      return { ...output, [key]: data[key as keyof object] };
    }, {});
  },
  convertPartData: (parts: PartEntity[]) => {
    return parts.map((part) => {
      return {
        upsert: {
          where: { id: part.id },
          create: {
            description: part.description,
            numberOfAnswers: part.numberOfAnswers,
            title: part.title,
            type: part.type,
            totalPoints: part.totalPoints,
            questions: part.questions.map((question) => {
              return {
                create: {
                  title: question.title,
                  description: question.description,
                  explain: question.explain,
                  answers: question.answers.map((answer) => {
                    return {
                      create: [
                        {
                          value: '',
                          isTrue: false,
                        },
                      ],
                    };
                  }),
                },
              };
            }),
          },
        },
      };
    });
  },
};
export default prismaUltis;
